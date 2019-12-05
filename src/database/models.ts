import mongoose from 'mongoose';

const { Schema } = mongoose;
const decimal = mongoose.Schema.Types.Decimal128;

const DocumentSchema = new Schema ({
    document_key: {
        type: String,
        required: true
    },
    document_creator: {
        type: String,
        required: true
    },
    document_tag: {
        type: String
    },
    highlights: [
        {
        content: {
            text: String
        },
        position: {
            boundingRect: {
                x1: decimal,
                y1: decimal,
                x2: decimal,
                y2: decimal,
                width: decimal,
                height:decimal
            },
            rects: [
                {
                    x1: decimal,
                    y1: decimal,
                    x2: decimal,
                    y2: decimal,
                    width: decimal,
                    height: decimal
                }
            ],
            pageNumber: Number
        },
        comment: {
            text: String,
            emoji: String
        }
    }]
},
    { timestamps: true }
    );

/**
 * @description converts all mongoose decimal instances to strings
 * @param v : object to convert
 * @param i : key of object v
 * @param prev
 */
const decimal2JSON = (v: any, i?:any, prev?:any) => {
    if (v !== null && typeof v === 'object') {
        if (v.constructor.name === 'Decimal128')
            prev[i] = v.toString();
        else
            Object.entries(v).forEach(([key, value]) => decimal2JSON(value, key, prev ? prev[i] : v));
    }
};

/**
 * @description overrides the toJSON method
 */
DocumentSchema.set('toJSON', {
    transform: (doc, ret) => {
        decimal2JSON(ret);
        return ret;
    }
});


export const documentModel = mongoose.model('Document', DocumentSchema);
