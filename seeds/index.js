const mongoose=require('mongoose');
const cities=require('./cities');
const {places, descriptors}=require('./seedsHelper');
const Campground=require('../models/campground');
const axios=require('axios');
// const dbUrl=process.env.DB_URL;

if(process.env.NODE_ENV!=="production"){
  require('dotenv').config()
}

mongoose.connect(process.env.DB_URL)
.then(()=>{
    console.log('Connection Open!');
})
.catch(e=>{
    console.log('Oops Error !');
    console.log(e);
});

const sample=array => array[Math.floor(Math.random()*array.length)];

// call unsplash and return small image
async function seedImg() {
    try {
      const resp = await axios.get('https://api.unsplash.com/photos/random', {
        params: {
          client_id: 'GwUkhpMu4qktKNP0JeEBIZC3ZJWUMHsxE-uA3JSsTN0',
          collections: 1114848,
        },  
      })
      return resp.data.urls.small
    } catch (err) {
      console.error(err)
    }
}  
const seedsDb=async()=>{
    await Campground.deleteMany({});
    for(let i=0;i<300;i++){
        const random=Math.floor(Math.random()*1000)+1;
        const price=Math.floor(Math.random()*20)+10;
        const camp=new Campground({
            location:`${cities[random].city}, ${cities[random].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            images: [
              {
                url: 'https://res.cloudinary.com/divzqmyft/image/upload/v1720006520/YelpCamp/tb0jamygihixzfjxad9f.jpg',       
                filename: 'YelpCamp/tb0jamygihixzfjxad9f'
              },
              {
                url: 'https://res.cloudinary.com/divzqmyft/image/upload/v1720006520/YelpCamp/iqce0oebwasmmbwnikam.jpg',       
                filename: 'YelpCamp/iqce0oebwasmmbwnikam'
              },
              {
                url: 'https://res.cloudinary.com/divzqmyft/image/upload/v1720006520/YelpCamp/qsmibsemagviss9jcrxb.jpg',       
                filename: 'YelpCamp/qsmibsemagviss9jcrxb'
              },
              {
                url: 'https://res.cloudinary.com/divzqmyft/image/upload/v1720006519/YelpCamp/zmofqjn5slvh4u7cjz20.jpg',       
                filename: 'YelpCamp/zmofqjn5slvh4u7cjz20'
              }
              
            ],
            geometry:{
              type:"Point",
              coordinates:[cities[random].longitude,cities[random].latitude]
            },
            description:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia eligendi pariatur perferendis maiores nesciunt adipisci consequuntur sint error repellat laboriosam. Ratione sit consequatur cupiditate accusamus reprehenderit laborum beatae cum in.",
            price,
            author:'668ce33f8e034a221c0825e5'
        })
        await camp.save();
    }
}

seedsDb().then(()=>{
    mongoose.connection.close();
})