const mongoose=require('mongoose');
const cities=require('./cities');
const {places, descriptors}=require('./seedsHelper');
const Campground=require('../models/campground');


mongoose.connect('mongodb://localhost:27017/yelp-camp')
.then(()=>{
    console.log('Connection Open!');
})
.catch(e=>{
    console.log('Oops Error !');
    console.log(e);
});

const sample=array => array[Math.floor(Math.random()*array.length)];

const seedsDb=async()=>{
    await Campground.deleteMany({});
    for(let i=0;i<50;i++){
        const random=Math.floor(Math.random()*1000)+1;
        const camp=new Campground({
            location:`${cities[random].city}, ${cities[random].state}`,
            title:`${sample(descriptors)} ${sample(places)}`
        })
        await camp.save();
    }
}

seedsDb().then(()=>{
    mongoose.connection.close();
})