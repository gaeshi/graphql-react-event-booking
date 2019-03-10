exports.checkAuth = req => {
    if (!req.isAuth) {
        throw new Error('Unauthenticated!');
    }
};