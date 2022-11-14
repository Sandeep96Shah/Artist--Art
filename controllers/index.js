const Art = require("../model/art");
const Users = require("../model/user");
const UserDetails = require("../model/userDetails");
const Cart = require("../model/cart");
const UserArt = require("../model/userArt");
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
const { use } = require("passport");

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
      password = "",
      confirmPassword = "",
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
    
    if(password && password !== confirmPassword) {
        return res.status(400).json({
            message: 'password does not match',
            status: 'failure',
        })
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

    // creating user-art
    const userArt = await UserArt.create({
      user: newUser._id,
      itemForSales: [],
      itemSold: [],
      itemBought: [],
    });

    // creating user-cart
    const userCart = await Cart.create({
      user: newUser._id,
      items: [],
    });

    // creating user-details
    const userDetails = await UserDetails.create({
      user: newUser._id,
      interests: [],
      notifications: [],
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
      userArt,
      userCart,
      userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add user!!!",
      status: "failed",
    });
  }
};

module.exports.signIn = async (req, res) => {
  try {
    const { password, email } = req.body || {};
    const user = await Users.findOne({ email: email });
    if (password === user.password) {
      const token = jwt.sign(
        { id: newUser._id, email: newUser.email },
        process.env.JWT_SECRET,
        { expiresIn: "10000000" }
      );
      const cart = await Cart.findOne({ user: user._id });
      const userDetails = await UserDetails.findOne({ user: use._id });
      const userArt = await UserArt.findOne({ user: user._id });
      return res.status(200).json({
        message: "Logged in successfully",
        status: "success",
        user,
        cart,
        userDetails,
        userArt,
        token,
      });
    } else {
      return res.status(400).json({
        message: "pasword/ email does not match",
        status: "failure",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "something went wrong while signing-in",
      status: "failure",
      error,
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

    // add the art details
    const userArtInfo = await UserArt.findOne({ user: userId });
    userArtInfo.itemForSales.push(art._id);
    await userArtInfo.save();

    return res.status(200).json({
      message: "successfully created the product",
      addedProduct: art,
      status: "success",
      userArtInfo,
    });
  } catch (error) {
    return res.status(500).json({
      message: "error while creating product!",
      error,
      status: "failure",
    });
  }
};

module.exports.getAllArts = async (req, res) => {
  try {
    const allArts = await Art.find({});
    return res.status(200).json({
      message: "fetched data from database",
      status: "success",
      allArts,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Samething went wrong while fetching data from database",
      status: "failure",
      error,
    });
  }
};

module.exports.userDetails = async (req, res) => {
  try {
    const { userId } = req.params || {};
    const user = await Users.findById(userId);
    const userDetails = await UserDetails.findOne({user: userId});
    
    const cart = await Cart.findOne({user: userId});
    const userArt = await UserArt.findOne({user: userId});
    return res.status(200).json({
      message: "fetched data successfully",
      user,
      userDetails,
      cart,
      userArt,
      status: "success",
    });
  } catch (error) {
    return res.status(500).json({
      message: "something went wrong to fetch data from database",
      status: "failure",
      error,
    });
  }
};

// todo add logic for notification and interests
module.exports.buyArt = async (req, res) => {
  try {
    const { boughtBy, boughtFrom, artId } = req.params || {};
    const art = await Art.findById(artId);
    const {title} = art || {};
    const boughtByUser = await UserArt.findOne({ user: boughtBy });
    const boughtFromUser = await UserArt.findOne({ user: boughtFrom });
    const userDetailsBy = await UserDetails.findOne({user: boughtBy}).populate('user', 'name');
    const userDetailsFrom = await UserDetails.findOne({user: boughtFrom}).populate('user', 'name');
    const {name: user1 } = userDetailsBy?.user || {};
    const {name: user2 } = userDetailsFrom?.user || {};
    const notification1 = `${title} is bought by ${user1}`;
    const notification2 = `You just bought ${title} from ${user2}`;
    userDetailsFrom.notification.push(notification1);
    await userDetailsFrom.save();
    userDetailsBy.notification.push(notification2);
    await userDetailsBy.save();
    boughtByUser.itemBought.push(artId);
    await boughtByUser.save();
    boughtFromUser.itemSold.push(artId);
    await boughtFromUser.save();
    return res.status(200).json({
      message: "successfully saved the data",
      status: "success",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add details in database",
      status: "failure",
      error,
    });
  }
};

// ToDo
// 1-> edit the created art
// 2-> work on interest
// 3-> nitification
