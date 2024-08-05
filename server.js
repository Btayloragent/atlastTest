const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const express = require("express")
const app = express();
const PORT = 3000;

app.use(express.json());



const teamSchema = new mongoose.Schema({
    teamName: {
        type: String,
        required: true,
    },
    teamState: {
        type: String,
        required: true
   
    },
})

const Team = mongoose.model("Team", teamSchema)

// get teams
app.get("/teams/:id", async (req, res) => {
    try {
        let id = req.params.id
        let foundTeam = await Team.findById(id)
        if (!foundTeam) {
            res.status(404).send("Team not found")
        }
        res.status(200).send(foundTeam)
    } catch (error) {
        console.log("error" + error)
        res.status(400).send(error)
    }
});

// Get teams by teamState
app.get("/teams/state/:teamState", async (req, res) => {
    try {
        const teamState = req.params.teamState;
        const teams = await Team.find({ teamState: teamState });

        if (teams.length === 0) {
            return res.status(404).send("No teams found for the given state");
        }

        res.status(200).send(teams);
    } catch (error) {
        console.log("error: " + error);
        res.status(400).send(error);
    }
});



// creating a team
app.post("/teams", async (req, res) => {
    try {
        const { teamName, teamState } = req.body;
        const newTeam = new Team({ teamName, teamState })
        await newTeam.save();
        res.status(201).send(newTeam)
    } catch (error) {
        console.log("error:" + error);
        res.status(400).send(error)
    }
});

// Update a team
app.put("/teams/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const { teamName,teamState } = req.body;

        
        if (!teamName && teamState) {
            return res.status(400).send("At least one field (teamName or teamState) is required to update.");
        }

        // Find and update the team
        const updatedTeam = await Team.findByIdAndUpdate(
            id,
            { teamName,teamState },
            { new: true, runValidators: true } // Return the updated document and run schema validation
        );

        if (!updatedTeam) {
            return res.status(404).send("Team not found");
        }

        res.status(200).send(updatedTeam);
    } catch (error) {
        console.log("error: " + error);
        res.status(400).send(error);
    }
});

// Delete a team
app.delete("/teams/:id", async (req, res) => {
    try {
        const id = req.params.id;

        // Find and delete the team
        const deletedTeam = await Team.findByIdAndDelete(id);

        if (!deletedTeam) {
            return res.status(404).send("Team not found");
        }

        res.status(200).send({ message: "Team deleted successfully", deletedTeam });
    } catch (error) {
        console.log("error: " + error);
        res.status(400).send(error);
    }
});





const uri = "mongodb+srv://btayloragent:vscode5@cluster0.zollofg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
async function connectDb() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    // Ensures that the client will close when you finish/error
    await mongoose.disconnect();
    console.log("error: " + error);
  }
}




app.listen(PORT, async() => {
    await connectDb().catch(console.dir);
    console.log(`Express API: localhost:${PORT}`)
})



