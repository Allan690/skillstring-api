import awsConfig from '../../config/aws-config';
import cache from '../../cache';
import env from "../../config/environment";

import { documentModel } from '../../database/models';

interface highlightBody {
    content: {
        text: {
            type: string
        }
    },
    position: {
        boundingRect: {
            x1: number,
            y1: number,
            x2: number,
            y2: number,
            width: number,
            height: number
        },
        rects: [
            {
                x1: number,
                y1: number,
                x2: number,
                y2: number,
                width: number,
                height: number
            }
        ],
        pageNumber: number
    },
    comment: {
        text: string,
        emoji: string
    },
    document: string
}

export const cacheKey = (bucketName: string) => `FILTERED_S3_OBJECTS_${bucketName}`;
export const getHighlightsKey = (owner: string, name: string) => `DOC_HIGHLIGHTS_${owner}_${name}`;

/**
 * @description gets all pdf objects from aws bucket
 * @param bucket: name of the bucket
 * @param maxKeys: maximum number of values to be returned
 */
export const getAllPdfObjects = async function getAllObjectsFromS3Bucket(bucket: string, maxKeys: number) {
    const params = {
        Bucket: bucket,
        MaxKeys: maxKeys
    };
    try {
        const alls3Objects = await awsConfig.listObjectsV2(params).promise();
        const { Contents, IsTruncated, Name, Prefix, MaxKeys, CommonPrefixes, KeyCount } = alls3Objects;
        const filteredDocs = Contents.filter(obj => { return /^[^.]+.pdf$/.test(obj.Key)});

        await cache.saveObject(cacheKey(env.AWS_ACCESS_KEY_ID), {
            Contents: filteredDocs,
            IsTruncated,
            Name,
            Prefix,
            MaxKeys,
            CommonPrefixes,
            KeyCount
        });
        return {
            Contents: filteredDocs,
            IsTruncated,
            Name,
            Prefix,
            MaxKeys,
            CommonPrefixes,
            KeyCount
        };
    }
    catch(err) {
        throw err;
    }
};

/**
 * @description saves pdf documents to database
 * @param name document name
 * @param etag document e-tag key from aws
 * @param creator : document creator
 */
export const saveFilteredObjects = async function saveObjectsToDatabase(name: string, etag: string, creator: string = 'root') {
    try {
        await documentModel.updateOne({ document_tag: etag }, {
            $set: {
                document_key: name, document_creator: creator, document_tag: etag
            }
        }, { upsert: true });
    }
    catch (err) {
        throw err;
    }
};

/**
 * @description updates the document with highlighted text
 * @param highlightBody: Object representing the coordinates of the  highlighted body of text
 * @param key : document key(name)
 * @param creator: document creator
 */
export const saveDocumentHighlights = async function saveHighlights(highlightBody: highlightBody, key: string, creator: string) {
    try {
        const highlightedDoc = await documentModel.updateOne(
            { document_key: key, document_creator: creator }, {
                $push: {
                    highlights: {
                        content: { text: highlightBody.content.text },
                        position: { boundingRect: {
                                x1: highlightBody.position.boundingRect.x1,
                                y1: highlightBody.position.boundingRect.y1,
                                x2: highlightBody.position.boundingRect.x2,
                                y2: highlightBody.position.boundingRect.y2,
                                width: highlightBody.position.boundingRect.width,
                                height: highlightBody.position.boundingRect.height
                            },
                            rects: [...highlightBody.position.rects],
                            pageNumber: highlightBody.position.pageNumber
                        },
                        comment: {
                            text: highlightBody.comment.text,
                            emoji: highlightBody.comment.emoji
                        }
                    }
                }
            });
       // await cache.saveObject(getHighlightsKey(creator, key), null);
        return highlightedDoc;
    }
    catch(err) {
        throw err;
    }
};

/**
 * @description returns all highlights on a document
 * TODO: Make highlights specific to a user
 */
export const getAllHighlights = async function getAllHighlights(key: string, owner: string) {
    try {
        const highlights = await documentModel.findOne({document_key: key, document_creator: owner });
       // await cache.saveObject(getHighlightsKey(owner, key), highlights);
        return highlights.toJSON()
    }
    catch(err) {
        throw err;
    }
};

/**
 * @description removes document from the database
 * @param owner:  document creator
 * @param name: document name(key)
 */
export const removeDocument = async function removeDocumentFromDB(owner: string = 'root', name: string) {
    try {
       const deletedDocument = await documentModel.findOneAndDelete(
           { document_creator: owner, document_key: name }
           );
       return deletedDocument;
    }
    catch(err) {
        throw err;
    }
};