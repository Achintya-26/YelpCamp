const express=require('express');
const router=express.Router();
const catchAsync=require('../utils/catchAsync');
const Campground=require('../models/campground');
const {isLoggedIn, validateCampground, isAuthor}=require('../middleware');



router.get('/',catchAsync(async(req,res)=>{
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
}))

router.get('/new', isLoggedIn, (req,res)=>{
    res.render('campgrounds/new');
})

router.get('/:id', catchAsync(async(req,res)=>{

    const {id}=req.params;
    const campground=await Campground.findById(id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');
    if(!campground){
        req.flash('error','Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{campground})
}))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async(req,res,next)=>{
    const camp=await Campground.findById(req.params.id);
    if(!camp){
        req.flash('error','Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{camp});
}))

router.post('/', isLoggedIn, validateCampground ,catchAsync(async(req,res,next)=>{
    const currentUserId=req.user._id;
    req.body.campground.author=currentUserId;
    const campground=new Campground(req.body.campground);
    await campground.save();
    req.flash('success','Successfully made a new campground !');
    res.redirect(`/campgrounds/${campground._id}`);
}))


router.put('/:id', isLoggedIn, isAuthor, validateCampground ,catchAsync(async(req,res,next)=>{
    const {id}=req.params;
    const camp=await Campground.findByIdAndUpdate(req.params.id,req.body.campground,{runValidators:true});
    req.flash('success','Successfully updated campground !')
    res.redirect(`/campgrounds/${camp._id}`)
})) 

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async(req,res)=>{
    const {id}=req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully deleted campground !');
    res.redirect('/campgrounds');
}))

module.exports=router