import React , {useContext} from 'react';
import moment from 'https://cdn.skypack.dev/moment?min';



const DayNames = {
  1: `Mon`,
  3: `Wed`,
  5: `Fri`
};

const Timeline = ({ range, data, colorFunc }) => {
  const cellHeight = `8px`;
  const cellWidth = `8px`;
  const cellMargin = `1px`;
  const cellWeekdaysWidth = `15px`;

  const timelineStyle = {
  };

  const timelineMonthsStyle = {
    display: `flex`,
    paddingLeft: cellWeekdaysWidth,
  };

  const timelineMonthsMonthStyle = {
    width: cellWidth,
    margin: cellMargin,
    border: `1px solid transparent`,
    fontSize: `10px`,
  };

  const timelineMonthsHiddenStyle = {
    visibility: `hidden`,
  };

  const timelineBodyStyle = {
    display: `flex`,
  };

  const timelineWeekdaysStyle = {
    display: `inline-flex`,
    flexDirection: `column`,
    width: cellWeekdaysWidth,
  };

  const timelineWeekdaysWeekdayStyle = {
    fontSize: `0px`,
    height: cellHeight,
    border: `1px solid transparent`,
    margin: cellMargin,
    verticalAlign: `middle`,
  };

  const timelineCellsStyle = {
    display: `inline-flex`,
    flexDirection: `column`,
    flexWrap: `wrap`,
    height: `${(parseInt(cellHeight) + 4) * 8}px`,
  };

  const timelineCellsCellStyle = {
    height: cellHeight,
    width: cellWidth,
    border: `1px solid rgba(0, 0, 0, 0.1)`,
    margin: cellMargin,
    borderRadius: `0.16vw `,
    backgroundColor: `rgba(0, 0, 0, 0.05)`,
  };

  const timelineCellsCellHoverStyle = {
    border: `1px solid rgba(0, 0, 0, 0.3)`,
  };

  let days = Math.abs(range[0].diff(range[1], `days`));
  let cells = Array.from(new Array(days));
  let weekDays = Array.from(new Array(7));
  let months = Array.from(new Array(Math.floor(days / 7)));

  let min = Math.min(0, ...data.map(d => d.value));
  let max = Math.max(...data.map(d => d.value));

  let colorMultiplier = 1 / (max - min);

  let startDate = range[0];
  const DayFormat = `DDMMYYYY`;

  const uniqueMonths = {};

  return (
    <div className='timeline' style={timelineStyle}>

      <div className="timeline-body" style={timelineBodyStyle}>
        <div className="timeline-weekdays" style={timelineWeekdaysStyle}>
          {weekDays.map((_, index) => (
            <div
              key={index}
              className='timeline-weekdays-weekday'
              style={timelineWeekdaysWeekdayStyle}
            >
              {DayNames[index]}
            </div>
          ))}
        </div>

        <div className="timeline-cells" style={timelineCellsStyle}>
          {cells.map((_, index) => {
            let date = moment(startDate).add(index, 'day');
            let dataPoint = data.find(d => moment(date).format(DayFormat) === moment(d.date).format(DayFormat));
            let alpha = colorMultiplier * dataPoint.value;
            let color = colorFunc({ alpha });

            return (
              <div
                key={index}
                className='timeline-cells-cell'
                style={{ ...timelineCellsCellStyle, backgroundColor: color }}
                onMouseOver={() => console.log(index + ":"+data[index].date._d  + ":" + data[index].value)}
              >
                <style>
                  {`
                    .timeline-cells-cell:hover { ${timelineCellsCellHoverStyle} }
                  `}
                </style>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
