//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-victor:test123@cluster0-c4qql.mongodb.net/todolistDB",{ useNewUrlParser: true, useUnifiedTopology: true },(err)=>{
  if(err) {
    console.log("You have an error: "+err)
  } else {
    console.log("Connected successfully in mongodb");
  }
});

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: 1
  }
});

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const Item = mongoose.model("item", itemsSchema);

const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Welcome to your to do list!"
});
const item2 = new Item({
  name: "Hit the + button to add a new task."
});
const item3 = new Item({
  name: "<--- Hit this to delete a task."
});
const defaultItems = [item1, item2, item3];


app.get("/", function(req, res) {

  
  
  Item.find((err, items) =>{
  if(items.length === 0) {
    Item.insertMany(defaultItems,(err)=>{
      if(!err) {
        res.redirect("/");
      }
    });
  } else {
    res.render("list", {listTitle: "Today", newListItems: items});
  }
  });
});

app.get("/:customList", function(req,res){
  const customList = _.capitalize(req.params.customList);
  
  List.findOne({name: customList}, (err, foundList)=> {
    if(!foundList) {
      // Create a new List
      const list = new List({
        name: customList,
        items: defaultItems
      })
      list.save();
      res.redirect("/"+customList);
    } else {
      // Show a existing List
      res.render("list", {listTitle: customList, newListItems: foundList.items});
    }
  });
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });
  
  if(listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  } 
});

app.post("/delete", (req, res)=> {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndDelete(checkedItemId, (err, foundList)=> {
      if(!err) {
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items:{_id: checkedItemId}}}, (err, foundList) => {
        if(!err) {
          res.redirect("/"+listName);
        }
    });
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
