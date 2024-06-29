const express=require('express');
const mongoose=require('mongoose');
const ejsMate=require('ejs-mate');
const session=require('express-session');
const flash=require('connect-flash');
const path=require('path');
const ExpressError=require('./utils/ExpressError');
const methodoverride=require('method-override');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/user')

const app=express();

app.engine('ejs',ejsMate);
app.set('views',path.join(__dirname,"/views"));
app.set('view engine','ejs');

app.use(express.urlencoded({extended:true}));
app.use(methodoverride('_method'));
app.use(express.static(path.join(__dirname,'public')));


const sessionConfig={
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        expires:Date.now() + 1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})

// Routes :
const campgroundRoutes=require('./routes/campgrounds');
const reviewRoutes=require('./routes/reviews');
const userRoutes=require('./routes/users');

mongoose.connect('mongodb://localhost:27017/yelp-camp')
.then(()=>{
    console.log('Connection Open!');
})
.catch((e)=>{
    console.log("Opps! Error connecting to database")
});

app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewRoutes)
app.use('/',userRoutes);

app.get('/home',(req,res)=>{
    res.render('home')
})

app.all('*',(req,res,next)=>{
    next(new ExpressError('Not Found Error!',404));
})

app.use((err,req,res,next)=>{
    const{statusCode=500}=err;
    if(!err.message) err.message='Oh no, Something went wrong !';
    res.status(statusCode).render('error',{err});
})

app.listen(3000,()=>{
    console.log("Listening on Port 3000");
})