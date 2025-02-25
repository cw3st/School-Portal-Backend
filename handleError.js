const multer = require("multer");

function handleError(err, req, res, next) {
    if(err instanceof multer.MulterError){
        return res.json({"sucess": false, "error":err.meesage})
    }
}
module.exports= handleError