import Conversation from '../models/conversation.model.js'
import Message from '../models/message.model.js'

export const sendMessage = async (req,res) => {
   try {
    const { message } = req.body;
    const {id: receiverId} = req.params;
    const senderId = req.user._id;

      let conversation = await Conversation.findOne({
         participants:{ $all : [ senderId, receiverId ]},
      });

      if(!conversation) {
         conversation = await Conversation.create({
            participants : [senderId, receiverId],
            //message is set []; in database
         })
      }

      const newMessage = new Message ({
         senderId ,
         receiverId ,
         message,
      });


      if(newMessage)
      {
         conversation.message.push(newMessage._id);
      }

      //await conversation.save();
      //await newMessage.save();

      //SOCKET IO  FUNCTIONALITY FOR REAL TiME
      
      //This will run in parallel just a optimization purpose
      await Promise.all([conversation.save(),newMessage.save()]);


      res.status(201).json(newMessage);

   } catch (error) {
    console.log("Error in sendMessage",error.message);
    res.status(500).json({error: "Internal Server Error"});
   }
} 


export const getMessages = async (req,res) =>{
   try {
      
         const {id :userToChatId } = req.params;
         const senderId = req.user._id;
         
         const conversation = await Conversation.findOne({
            participants: { $all: [senderId,userToChatId]},
         }).populate("message");

         res.status(200).json(conversation.message);

         if(!conversation) return res.status(200).json([])



   } catch (error) {
      console.log("Error in getMessages Controller  : ",error.message);
      res.status(500).json({error: "Internal Server Error"});
   }
}