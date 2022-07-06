import all from "~/enums/robots";

const getRobotModel = (uuid?: string) => {
  if (uuid) {
    const robotModel = all.find((a) => a.uuid === uuid);
    if (!robotModel)
      return Promise.reject(`Could not find robot model ${uuid}`);
    return Promise.resolve(robotModel);
  } else {
    const robotModel = all[Math.floor(Math.random() * all.length)];
    return Promise.resolve(robotModel);
  }
};

export default getRobotModel;
