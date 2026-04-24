import fs from 'fs'
import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadFolder = 'uploads/other'

        switch (file.fieldname) {
            case 'avatar':
                uploadFolder = 'uploads/avatar'
                break
            case 'professional_avatar':
                uploadFolder = 'uploads/professional_avatar'
                break
            case 'kyc_document':
                uploadFolder = 'uploads/kyc_document'
                break
            case 'license_document':
                uploadFolder = 'uploads/license_document'
                break
            default:
                uploadFolder = 'uploads/other'
        }

        fs.mkdirSync(uploadFolder, { recursive: true })

        cb(null, uploadFolder)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const ext = path.extname(file.originalname)
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
    },
})

function fileFilter(req, file, cb) {
    if (file.fieldname === 'license') {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true)
        } else {
            cb(new Error('Only image files are allowed for license uploads!'), false)
        }
    } else {
        cb(null, true)
    }
}

export const multerUpload = multer({
    storage,
    fileFilter,
    // limits: { fileSize: 5 * 1024 * 1024 },
})
