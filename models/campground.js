const mongoose=require('mongoose');
const Review=require('./review')
const Schema=mongoose.Schema;


const ImageSchema=new Schema({
    url:String,
    filename:String
});
ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_300/')
})

const CampgroundSchema=new Schema({
    title:String,
    images:[ImageSchema],
    price:Number,
    description:String,
    location:String,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
});

CampgroundSchema.post('findOneAndDelete',async(doc)=>{
    const {reviews}=doc;
    await Review.deleteMany({_id :{$in : reviews}});
})

module.exports=mongoose.model('Campground',CampgroundSchema);