//Create token and save in the cookie
export default (user,statusCode,res) => {

    //create jwt token
    const token = user.getJwtToken()

    //Options for Cookie
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000 ),
        httpOnly: true,
    };
    res.status(statusCode).cookie("token", token, options).json ({
        token,
    });
};