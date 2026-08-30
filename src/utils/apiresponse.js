class apiResponse{
    constructor(
        statusCode,
        data,
        message="success",
        stack
    ){
        this.statusCode=statusCode
        this.data=data
        this.message=message
        this.success=statusCode<400
        if(stack){
            this.stack=stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export { apiResponse }