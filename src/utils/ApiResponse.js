class ApiResponse{
    constructor(status,message='Success',data){
        this.status = status < 400
        this.data = data
        this.message = message
    }
}

export default ApiResponse