import express from "express";

const app = express();

app.use((req, res, next) => {
  console.log(req.url);
  next();
});

//Error handling middleware
app.use((err, req, res, next) => {
  const errorState = err.status || 500;
  const errorMessage = err.message || "Something went wrong";
  return res.status(errorState).json({
    success: false,
    status: errorState,
    message: errorMessage,
    stack: err.stack,
  });
});

app.listen(8080, () => {
  console.log("connected to backend");
});
