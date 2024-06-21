const express=require('express');
const mongoose=require('mongoose');
const ejsMate=require('ejs-mate');
const path=require('path');
const {campgroundSchema}=require('./schemas')
const catchAsync=require('./utils/catchAsync');
const ExpressError=require('./utils/ExpressError');
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

const validateCampground = (req,res,next)=>{
    
    const {error}=campgroundSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg,400);
    }
    else {
        next();

    }
}

app.get('/home',(req,res)=>{
    res.render('home')
})

app.get('/campgrounds',catchAsync(async(req,res)=>{
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
}))

app.get('/campgrounds/new',(req,res)=>{
    res.render('campgrounds/new');
})

app.get('/campgrounds/:id', catchAsync(async(req,res)=>{
    const {id}=req.params;
    const campground=await Campground.findById(id);
    res.render('campgrounds/show',{campground})
}))

app.get('/campgrounds/:id/edit', catchAsync(async(req,res,next)=>{
    const camp=await Campground.findById(req.params.id);
    res.render('campgrounds/edit',{camp});
}))

app.post('/campgrounds',validateCampground ,catchAsync(async(req,res,next)=>{
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data',400);
    
    const campground=new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))


app.put('/campgrounds/:id',validateCampground ,catchAsync(async(req,res,next)=>{
    const camp=req.body;
    await Campground.findByIdAndUpdate(req.params.id,camp.campground,{runValidators:true});
    res.redirect(`/campgrounds/${req.params.id}`)
})) 

app.delete('/campgrounds/:id',catchAsync(async(req,res)=>{
    const {id}=req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

app.all('*',(req,res,next)=>{
    next(new ExpressError('Not Found Error!',404));
})

app.use((err,req,res,next)=>{
    if(!err.message) err.message='Oh no, Something went wrong !';
    res.status(err.statusCode).render('error',{err});
})

app.listen(3000,()=>{
    console.log("Listening on Port 3000");
})