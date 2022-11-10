const Art = require('../model/art');
const Users = require('../model/user');
const dotenv = require('dotenv');
dotenv.config();
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const bucketName = process.env.BUCKET_NAME;
const region = process.env.BUCKET_REGION;
const accessKeyId = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
    region,
})

module.exports.createUser = async (req, res) => {
    try {
        const { 
            email = '', 
            name = '', 
            phoneNo, 
            bio = '', 
            address = '', 
        } = req.body || {};
        const { originalname: profilePic = '', 
                buffer = '', 
                mimetype = '' 
            } =  req.file || {};
        const existingUser = await Users.findOne({ email });
        if(existingUser) {
            return res.status(200).json({
                message: "User already exist",
            })
        }
        // need to add jwt token
        const putParams = {
            Bucket: bucketName,
            Key: profilePic,
            Body: buffer,
            ContentType: mimetype,
        };

        const putCommand = new PutObjectCommand(putParams);
        await s3.send(putCommand);

        const newUser = await Users.create({
            email,
            name,
            phoneNo, 
            bio, 
            profilePic,
            address,
        });

        const getParams = {
            Bucket: bucketName,
            Key: profilePic,
        }

        const getCommand = new GetObjectCommand(getParams);
        const imageUrl = await getSignedUrl(s3, getCommand, { expiresIn: 3600 });

        // try to add imageUrl data in ProfilePic of user object
        return res.status(200).json({
            message: 'user is added successfully!!!',
            status: 'success',
            user: newUser,
            profilePic: imageUrl,
        })
    } catch(error) {
        return res.status(500).json({
            message: "Failed to add user!!!",
            status: 'failed',
        })
    }
};

