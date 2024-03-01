import User from '../models/user.model.js'


export const getUsersForSidebar = async (req,res) =>{
    try {
        const loggedInUserId = req.user._id;

        //const allUsers = await User.find()

        const filteredUsers = await User.find({_id: {$ne: loggedInUserId }}).select("-password")

        res.status(200).json(filteredUsers);

    } catch (error) {
        
    }
}