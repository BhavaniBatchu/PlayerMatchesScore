const express = require("express");
const {open} = require("sqlite");
const sqlite3 = require("Sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

const app = express();

app.use = (express.json());

let db = null;

const initializeDbAndServer = async() => {
    try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
      });
      app.listen(3000, () => {
      console.log("Server is Running");
      });
      } catch(error) {
      console.log('db error ${error.message}');
      process.exit(1);
      };
      };

initializeDbAndServer();

const convertPlayerDbObjectToResponseObject = (dbObject) => {
  return {
       playerId: dbObject.player_id,
       playerName: dbObject.player_name,
  };
};

const convertMatchDetailsDbObjectToResponseObject = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

app.get("/players/", async(request,response) => {
  const getPlayerQuery = `
  SELECT
  *
  FROM
  player_details;` ;
  const playerArray = await db.all(getPlayerQuery);
  response.send(
    playerArray.map((eachPlayer) =>
    convertPlayerDbObjectToResponseObject(eachPlayer)
    )
    );
});

app.get("/players/:playerId", async(request,response) => {
const {playerId} = request.params;
const getPlayerQuery = `
 SELECT 
 *
 FROM 
 player_details
 WHERE 
 player_id = ${playerId};` ;
const player = await db.all(getPlayerQuery);
response.send(convertPlayerDbObjectToResponseObject(player));
});

app.put("/players/:playerId/", async(request,response) => {
  const {playerId} = request.params;
  const {playerName} = request.body;
  const updatePlayerQuery = `
  UPDATE 
  player_details
  SET
  player_name = ${playerName}
  WHERE 
  player_id = ${playerId};` ;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated"); 
});

app.get("/matches/:matchId/", async(request,response) => {
  const {matchId} = request.params;
  const matchDetailsQuery = `
  SELECT 
  *
  FROM
  match_details
  WHERE 
  match_id = ${matchId};` ;
  const matchDetails = await db.all(matchDetailsQuery);
  response.send(convertMatchDetailsDbObjectToResponseObject(matchDetails));
});

app.get("/players/:playerId/matches/",async(request,response) => {
const {playerId} = request.params;
const getPlayerMatchesQuery = `
SEELCT 
*
FROM 
player_match_score
NATURAL JOIN match_details
WHERE
player_id = ${playerId};` ;
const playerMatches = await db.all(getPlayerMatchesQuery);
response.send(
  playerMatches.map((eachMatch) =>
  convertMatchDetailsDbObjectToResponseObject(eachMatch)
  )
);
});

app.get("/matches/:matchId/players/", async(request,response)=> {
  const {matchId} = request.params;
  const getMatchPlayerQuery = `
  SELECT 
  *
  FROM 
  player_match_score
  NATURAL JOIN player_details
  WHERE match_id = ${matchId};` ;
  const playersArray = await db.all(getMatchPlayerQuery);
  response.send(
    playersArray.map((eachPlayer) =>
    convertPlayerDbObjectToResponseObject(eachPlayer)
  )
  );
});

app.get("/players/:playerId/playerScores/", async(request,response) => {
  const {playerId} = request.params;
  const getMatchPlayersQuery = `
  SELECT player_id AS playerId,
  player_name AS playerName,
  SUM(score) AS totalScore,
  SUM(fours) AS totalFours,
  SUM(sixes) AS totalSixes
  FROM player_match_score
  NATURAL JOIN  player_details
  WHERE player_id = ${playerId};` ;
  const playerMatchDetails = await db.all(getMatchPlayersQuery);
  response.send(playerMatchDetails);
});

module.exports = app;