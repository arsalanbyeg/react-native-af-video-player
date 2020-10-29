export const checkSource = (uri) => {
  return typeof uri === 'string' ?
    { source: { uri } } : { source: uri }
};

export const dummy = (length, val) => {
  let array = [];
  for (let i = 0; i < length; i++) array.push(val || i);
  return array;
};

export const isValidURL = str => {
  var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  return !!pattern.test(str);
};

export const parserVtt = data => {
  const getData = () => {
    const enter = data.split("")[data.split("").length - 1] === "\n";
    return `${data}${enter ? "" : "\n"}`;
  };

  const getTimeFormat = (val = "") => {
    const time = val.split(":");
    time.length < 3 ? time.unshift(...dummy(3 - time.length, "00")) : time;
    return time.join(":");
  };

  var timeMs = (val = "") => {
    var regex = /(\d+):(\d{2}):(\d{2})[,.](\d{3})/;
    var parts = regex.exec(getTimeFormat(val.trim()));
    if (parts === null) return 0;
    for (var i = 1; i < 5; i++) {
      parts[i] = parseInt(parts[i], 10);
      if (isNaN(parts[i])) parts[i] = 0;
    }
    return parts[1] * 3600000 + parts[2] * 60000 + parts[3] * 1000 + parts[4];
  };

  const fromSrt = () => {
    var all = [];
    var content = [];

    getData().split("\n").map(item => {
      if (item.trim() === "") {
        all.push(content)
        content = []
      } else content.push(item);
    });
    
    return all.slice(1).map((item, i) => {
      const time = index => timeMs(String(item[0]).split("-->")[index]);
      return {
        id: i,
        time: item[0],
        startTime: time(0),
        endTime: time(1),
        text: all.slice(1)[i].slice(1).join("'\n'")
      }
    })
  };

  return fromSrt();
};