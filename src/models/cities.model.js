import { Schema, model } from 'mongoose'

const translationSchema = new Schema(
    {
        br: String,
        ko: String,
        'pt-BR': String,
        pt: String,
        nl: String,
        hr: String,
        fa: String,
        de: String,
        es: String,
        fr: String,
        ja: String,
        it: String,
        'zh-CN': String,
        tr: String,
        ru: String,
        uk: String,
        pl: String,
        hi: String,
        ar: String,
    },
    { _id: false },
)

const locationSchema = new Schema(
    {
        id: {
            type: Number,
            required: true,
            unique: true,
            index: true,
        },

        name: {
            type: String,
            required: true,
        },

        state_id: Number,
        state_code: String,
        state_name: String,

        country_id: Number,
        country_code: String,
        country_name: String,

        latitude: {
            type: Number, // ⚠️ convert from string
            required: true,
        },

        longitude: {
            type: Number, // ⚠️ convert from string
            required: true,
        },

        native: String,

        type: {
            type: String, // e.g. "adm2"
        },

        level: {
            type: Number,
            default: null,
        },

        parent_id: {
            type: Number,
            default: null,
        },

        population: Number,

        timezone: String,

        translations: translationSchema,

        wikiDataId: String,
    },
    {
        timestamps: true,
    },
)
const Cities = model('Cities', locationSchema)
export default Cities
