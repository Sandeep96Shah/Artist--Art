const Art = require("../model/art");
const Users = require("../model/user");
const dotenv = require("dotenv");
dotenv.config();
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const jwt = require("jsonwebtoken");

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
});

module.exports.createUser = async (req, res) => {
  try {
    const {
      email = "",
      name = "",
      phoneNo,
      bio = "",
      address = "",
    } = req.body || {};
    const {
      originalname: profilePic = "",
      buffer = "",
      mimetype = "",
    } = req.file || {};
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.status(200).json({
        message: "User already exist",
      });
    }

    const putParams = {
      Bucket: bucketName,
      Key: profilePic,
      Body: buffer,
      ContentType: mimetype,
    };

    const putCommand = new PutObjectCommand(putParams);
    await s3.send(putCommand);

    const getParams = {
        Bucket: bucketName,
        Key: profilePic,
      };

    const getCommand = new GetObjectCommand(getParams);
    const imageUrl = await getSignedUrl(s3, getCommand, { expiresIn: 3600 });

    const newUser = await Users.create({
      email,
      name,
      phoneNo,
      bio,
      profilePic: imageUrl,
      address,
    });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "10000000" }
    );

    return res.status(200).json({
      message: "user is added successfully!!!",
      status: "success",
      user: newUser,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add user!!!",
      status: "failed",
    });
  }
};

module.exports.test = async (req, res) => {
  return res.status(200).json({
    message: "tested",
  });
};

module.exports.createArt = async (req, res) => {
  try {
    const { title, description, price, totalPiece, userId } = req.body || {};
    const pictures = [];
    for (let picture of req.files) {
      const { originalname = "", buffer = "", mimetype = "" } = picture || {};

      const putParams = {
        Bucket: bucketName,
        Key: originalname,
        Body: buffer,
        ContentType: mimetype,
      };

      const putCommand = new PutObjectCommand(putParams);
      await s3.send(putCommand);

      const getParams = {
        Bucket: bucketName,
        Key: originalname,
      };
      
      const getCommand = new GetObjectCommand(getParams);
      const imageUrl = await getSignedUrl(s3, getCommand, { expiresIn: 3600 });
      pictures.push(imageUrl);
    }

    const art = await Art.create({
      title,
      description,
      price,
      totalPiece,
      user: userId,
      pictures,
    });

    return res.status(200).json({
      message: "successfully created the product",
      addedProduct: art,
      status: "success",
    });
  } catch (error) {
    return res.status(500).json({
      message: "error while creating product!",
      error,
      status: "failure",
    });
  }
};
