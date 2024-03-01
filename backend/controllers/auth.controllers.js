import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateTokenandSetCookie from '../utils/generateToken.js'




export const signup = async (req, res) => { 
    try {
        const { fullname, username, password, confirmedpassword, gender } = req.body;

        if(password !== confirmedpassword){
            return res.status(400).json({ error: 'Password and confirmed password do not match'});
        }

        const user = await User.findOne({ username});
        if(user) {
            return res.status(400).json({error: 'User already exist'});
        }

        //HASH PASSWORD MATCH
        const salt = await bcrypt.genSalt(10);
        const hashpassword = await bcrypt.hash(password, salt);



        //https://avatar.iran.liara.run/public/boy?username=Scott
        const boyProfilePic  = `https://avatar.iran.liara.run/public/boy?username=${username}`
        const girlProfilePic  = `https://avatar.iran.liara.run/public/girl?username=${username}`

        const newUser = new User ({
            fullname,
            username,
            password : hashpassword,
            gender,
            profilePic : gender ==="male" ? boyProfilePic : girlProfilePic
        })

        if (newUser){
            
            //Generate JWT token 
            generateTokenandSetCookie(newUser._id,res);
            await newUser.save();

        res.status(201).json({
            _id : newUser._id,
            fullName : newUser.fullname,
            username : newUser.username,
            profilePic : newUser.profilePic

        });
        } else {
            res.status(400).json({error: "Invalid user data "})
        }

    } catch (error) { 
        console.log("Error in signup Contoller: " ,error.message)
        res.status(500).json({error : "Internal Server Error "})
    }
    
};


export const login = async (req, res) => { 
   try {
    const {username, password} = req.body;
    const user = await User.findOne({username})
    const isPasswordCorrect = await bcrypt.compare(password, user?.password || "")

    if(!user || !isPasswordCorrect)
    {
        return res.status(400).json({error: "Invalid username or password"});
    }

    generateTokenandSetCookie(user._id,res);
    
    res.status(200).json({
        _id : user._id,
        fullName : user.fullname,
        username : user.username,
        profilePic : user.profilePic
    });





   }catch (error) {
    console.log("Error in Login Contoller: " ,error.message)
    res.status(500).json({error : "Internal Server Error "})
   }
};




export const logout =  (req, res) => { 
   try {
        res.cookie("jwt","",{maxAge:0})
        res.status(200).json({message : "Logged Out Succesfully  "})


   } catch (error) {
    console.log("Error in Logout Contoller: " ,error.message)
    res.status(500).json({error : "Internal Server Error "})
   }
};


