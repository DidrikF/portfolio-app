import axois from "axios"

class Server {
    async getImages() {
        try  {
            const response = await axois.get("/images")
            return response.data.images
        } catch (error) {
            return error
        }
    }
}


const S = new Server()

export default S