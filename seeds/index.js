const mongoose=require('mongoose');
const cities=require('./cities');
const {places, descriptors}=require('./seedsHelper');
const Campground=require('../models/campground');
const axios=require('axios');


mongoose.connect('mongodb://localhost:27017/yelp-camp')
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
    // await Campground.deleteMany({});
    for(let i=0;i<48;i++){
        const random=Math.floor(Math.random()*1000)+1;
        const price=Math.floor(Math.random()*20)+10;
        const camp=new Campground({
            location:`${cities[random].city}, ${cities[random].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            image: await seedImg(),
            description:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia eligendi pariatur perferendis maiores nesciunt adipisci consequuntur sint error repellat laboriosam. Ratione sit consequatur cupiditate accusamus reprehenderit laborum beatae cum in.",
            price
        })
        await camp.save();
    }
}

seedsDb().then(()=>{
    mongoose.connection.close();
})