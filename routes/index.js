const router = require("express").Router();
const passport = require("../config/passportJWT");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const userControllers = require("../controllers/index");

router.post("/create-user", upload.single("image"), userControllers.createUser);

router.post(
  "/create-art",
  passport.authenticate("jwt", { session: false }),
  upload.array("photos", 12),
  userControllers.createArt
);

router.get("/all-arts", userControllers.getAllArts);

router.get(
  "/user-details/:userId",
  passport.authenticate("jwt", { session: false }),
  userControllers.userDetails
);

router.get('/sign-in', userControllers.signIn);

router.get(
  "/test",
  passport.authenticate("jwt", { session: false }),
  userControllers.test
);

router.get(
  "/buy-art/:boughtBy/:boughtFrom/:artId",
  passport.authenticate("jwt", { session: false }),
  userControllers.buyArt
);

router.get("/", (req, res) => {
  return res.send("hello");
});

module.exports = router;
