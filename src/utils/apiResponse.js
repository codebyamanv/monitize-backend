class ApiResponse {
    constructor(statusCode, data, message = 'Success') {
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }

    static success(data, message = 'Success', statusCode = 200) {
        return new ApiResponse(statusCode, data, message)
    }

    static created(data, message = 'Created successfully', statusCode = 201) {
        return new ApiResponse(statusCode, data, message)
    }

    static noContent(message = 'No content', statusCode = 204) {
        return new ApiResponse(statusCode, null, message)
    }

    static badRequest(message = 'Bad request', statusCode = 400) {
        return new ApiResponse(statusCode, null, message)
    }

    static unauthorized(message = 'Unauthorized', statusCode = 401) {
        return new ApiResponse(statusCode, null, message)
    }

    static forbidden(message = 'Forbidden', statusCode = 403) {
        return new ApiResponse(statusCode, null, message)
    }

    static notFound(message = 'Not found', statusCode = 404) {
        return new ApiResponse(statusCode, null, message)
    }

    static conflict(message = 'Conflict', statusCode = 409) {
        return new ApiResponse(statusCode, null, message)
    }

    static internalServerError(message = 'Internal server error', statusCode = 500) {
        return new ApiResponse(statusCode, null, message)
    }
    send(res) {
        return res.status(this.statusCode).json({
            success: this.success,
            statusCode: this.statusCode,
            message: this.message,
            data: this.data,
            timestamp: new Date().toISOString(),
        })
    }
}

export default ApiResponse
