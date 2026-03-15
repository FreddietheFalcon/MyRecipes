import monggse from "mongoose";

//1st step: You need to create a schema  
//2nd step: You would create a model based off of that schema  

const noteSchema = new monggse.Schema({ 
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
}, { timestamps: true });

const Note = monggse.model("Note", noteSchema);
export default Note;