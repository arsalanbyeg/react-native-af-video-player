export const checkSource = (uri) => {
  return typeof uri === 'string' ?
    { source: { uri } } : { source: uri }
};

export const parseVtt = (data, useMs) => {
  const parse = []
  const getData = () => {
      const enter = data.split("")[data.split("").length - 1] === "\n";
      return `${data}${enter ? "" : "\n"}`;
  };

  const splitted = getData().split("\n");
  splitted.map((e, i) => {
      const time = String(splitted[i - 2]);

      const getMS = (item = "") => {
          const digit = item.split(":").reverse();
          const zero = val => (val === null || val === undefined) ? 0 : val;
          return zero(digit[0]) * 1000 + zero(digit[1]) * 60000 + zero(digit[2]) * 3600000;
      };

      if (!e) {
          parse.push({
              ...useMs ? {
                  startTime: getMS(time.split("-->")[0]),
                  endTime: getMS(time.split("-->")[1])
              } : { time },
              text: splitted[i - 1],
          });
      }
  });

  return parse.map((e, id) => ({ ...e, id })).splice(1)
};
