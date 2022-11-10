const router = require('express').Router();

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({storage: storage});

const userControllers = require('../controllers/index');

router.post('/add-user',upload.single('image'), userControllers.createUser);

router.get('/', (req,res) => {
    return res.send('hello');
});

module.exports = router;