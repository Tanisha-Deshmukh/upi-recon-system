const AsyncHandler = (requestHandler) => {
    return async (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)) // ✅ Comma, not a period!
            .catch((error) => next(error))
    }
}
export { AsyncHandler }