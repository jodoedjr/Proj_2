// Requiring our models and passport as we've configured it
const db = require("../models");
const passport = require("../config/passport");

module.exports = function(app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    // Sending back a password, even a hashed password, isn't a good idea
    res.json({
      email: req.user.email,
      id: req.user.id
    });
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", (req, res) => {
    db.User.create({
      email: req.body.email,
      password: req.body.password
    })
      .then(() => {
        res.redirect(307, "/api/login");
      })
      .catch(err => {
        res.status(401).json(err);
      });
  });

  // Route for logging user out
  app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", (req, res) => {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    } else {
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      res.json({
        email: req.user.email,
        id: req.user.id
      });
    }
  });

  //********************************************************
  // Journal APIs

  //get user's/shared journals
  app.get("/api/journal", (req, res) => {
    //get user's journals and shared journals
    //setup a query object
    const query = {};
    if (req.query.UserId) {
      query.UserId = req.query.user_id;
    }
    query.shared = true;
    //find all journals by user, or shared with user
    db.Journal.findAll({
      where: query,
      include: [db.User]
    }).then(dbJournal => {
      //send results back to front end
      res.json(dbJournal);
    });
  });

  //post new journal
  app.post("/api/journal", (req, res) => {
    //create a Journal table entry with title, shared status, points list, color, and user id
    db.Journal.create({
      title: req.body.title,
      shared: req.body.shared,
      points: req.body.points,
      color: req.body.color,
      UserId: req.body.UserId
    })
      .then(result => {
        //res.redirect(307, "/api/login");
        res.json(result);
      })
      .catch(err => {
        res.status(401).json(err);
      });
  });

  //delete a journal
  app.delete("/api/journal/:id", (req, res) => {
    db.Journal.destroy({
      // destroy id'ed journal
      where: {
        id: req.params.id
      }
    }).then(dbJournal => {
      res.json(dbJournal); // send result back
    });
  });

  //update existing journal
  app.put("/api/journal", (req, res) => {
    db.Journal.update(req.body, {
      where: {
        id: req.body.id
      }
    }).then(dbJournal => {
      res.json(dbJournal);
    });
  });
};
