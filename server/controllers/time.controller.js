import Time from "../models/time.model.js";

export const getTimes = async (req, res) => {
  try {
    const times = await Time.find();
    res.status(200).json(times);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTime = async (req, res) => {
  try {
    const { dateTime } = req.body;
    const newTime = new Time({ dateTime });
    await newTime.save();
    res
      .status(201)
      .json({ message: "Time created successfully", time: newTime });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTime = async (req, res) => {
  try {
    const { id } = req.params;
    const { dateTime } = req.body;
    const updatedTime = await Time.findByIdAndUpdate(
      id,
      { dateTime },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "Time updated successfully", time: updatedTime });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
