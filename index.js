const express=require('express');
const mongoose=require('mongoose');
const ejsMate=require('ejs-mate');
const path=require('path');
const Campground=require('./models/campground');
const methodoverride=require('method-override');

const app=express();

app.engine('ejs',ejsMate);
app.set('views',path.join(__dirname,"/views"));
app.set('view engine','ejs');

app.use(express.urlencoded({extended:true}));
app.use(methodoverride('_method'));

mongoose.connect('mongodb://localhost:27017/yelp-camp')
.then(()=>{
    console.log('Connection Open!');
})
.catch(e=>{
    console.log('Oops Error !');
    console.log(e);
});

app.get('/home',(req,res)=>{
    res.render('home')
})

app.get('/campgrounds',async(req,res)=>{
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
})

app.get('/campgrounds/new',(req,res)=>{
    res.render('campgrounds/new');
})

app.get('/campgrounds/:id', async(req,res)=>{
    const {id}=req.params;
    const campground=await Campground.findById(id);
    res.render('campgrounds/show',{campground})
})

app.get('/campgrounds/:id/edit',async(req,res)=>{
    const camp=await Campground.findById(req.params.id);
    res.render('campgrounds/edit',{camp});
})
app.post('/campgrounds',async(req,res)=>{
    const campground=new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
})


app.put('/campgrounds/:id',async(req,res)=>{
    const camp=req.body;
    await Campground.findByIdAndUpdate(req.params.id,camp.campground,{runValidators:true});
    res.redirect(`/campgrounds/${req.params.id}`)
})  

app.delete('/campgrounds/:id',async(req,res)=>{
    const {id}=req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

app.listen(3000,()=>{
    console.log("Listening on Port 3000");
})