const Campground=require('../models/campground');
const mbxGeocoding=require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken=process.env.MAPBOX_TOKEN;
const {cloudinary}=require('../cloudinary')

const geocoder=mbxGeocoding({accessToken:mapBoxToken})
module.exports.index=async(req,res)=>{
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
}

module.exports.renderNewForm=(req,res)=>{
    res.render('campgrounds/new');
}
module.exports.createCampground=async(req,res,next)=>{
    const geodata=await geocoder.forwardGeocode({
        query:req.body.campground.location,
        limit:1
    }).send();
    req.body.campground.geometry=geodata.body.features[0].geometry;
    const currentUserId=req.user._id; 
    req.body.campground.author=currentUserId;
    const campground=new Campground(req.body.campground);
    campground.images=req.files.map(f=>({url:f.path, filename: f.filename}))
    // console.log(campground.images);
    await campground.save();
    req.flash('success','Successfully made a new campground !');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground=async(req,res)=>{

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
}

module.exports.renderEditForm=async(req,res,next)=>{
    const camp=await Campground.findById(req.params.id);
    if(!camp){
        req.flash('error','Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{camp});
}

module.exports.updateCampground=async(req,res,next)=>{
    const camp=await Campground.findByIdAndUpdate(req.params.id,req.body.campground,{runValidators:true});
    const imgs=(req.files.map(f=>({url:f.path, filename: f.filename})));
    camp.images.push(...imgs);
    await camp.save();
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await camp.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}});}
    // console.log(req.body);
    req.flash('success','Successfully updated campground !')
    res.redirect(`/campgrounds/${camp._id}`)
}

module.exports.deleteCampground=async(req,res)=>{
    const {id}=req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully deleted campground !');
    res.redirect('/campgrounds');
}