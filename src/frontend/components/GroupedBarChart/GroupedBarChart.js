import React from "react"
import {
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"

import { availableParties } from "../../helpers/parties.js"

function AxisTick(props) {
  const { x, y, width, height, stroke, fill, payload } = props

  return (
    <text
      width={width}
      height={height}
      x={x}
      y={y}
      stroke={stroke}
      fill={fill}
      textAnchor="middle"
    >
      <tspan x={x} y={y} dy={"1em"} fill="#666" fontSize={12}>
        {payload.value}
      </tspan>
    </text>
  )
}

function CustomTooltip(props) {
  const { active } = props

  if (active) {
    const data = props.payload
      .map(d => ({
        name: availableParties[props.userCountry].find(
          p => p.shortName === d.dataKey
        ).party,
        value: d.value
      }))
      .filter(d => d.name && d.value)
      .sort((a, b) => (a.value > b.value ? -1 : 1))

    return (
      <div
        style={{ padding: "10px", borderRadius: 5, backgroundColor: "#222", border: '2px solid white' }}
      >
      <p style={{ color: "#fff", textAlign: 'center', textDecoration: 'underline' }}>{props.label}</p>
        {data.map(d => (
          <p key={d.name} className="label" style={{ color: "#fff" }}>
            <span style={{ color: "#fff" }}>{d.name}</span>{" "}
            <strong style={{ color: "#fff" }}>{d.value}%</strong>
          </p>
        ))}
      </div>
    )
  }

  return null
}

const toPercent = (decimal, fixed = 0) => {
	return `${(decimal).toFixed(fixed)}%`;
};

export const GroupedBarChart = props => {
  const orderedKeysNewLayout = ['country', 'sex_male', 'sex_female', 'polit_left', 'polit_right', 'age_gt45', 'age_lt45'];
  const data = orderedKeysNewLayout.filter(d => Array.isArray(props.advertisers[d]))
    .map(d => {
      return {
        name: props.filterLabels[d],
        ...props.advertisers[d].reduce(
          (prev, curr) => ({
            ...prev,
            [curr.party]: parseFloat(curr.percentage)
          }),
          {}
        )
      }
    })
  // console.log('DATA', data)

  return (
    <div>
      <BarChart data={data} width={770} height={290} margin={{ left: 30, top: 30, bottom: 20 }}>
        <CartesianGrid strokeDasharray="1 3"/>
        <Tooltip content={<CustomTooltip userCountry={props.userCountry} />} />
        <Legend verticalAlign="top" height={42} iconType="square" align="center" margin={{ bottom: 20 }}/>
        <XAxis dataKey="name" tick={<AxisTick />}/>
        <YAxis tickFormatter={toPercent} tick={{fontSize: 12}} domain={[0, 100]} ticks={[0,25,50,75,100]}/>
        {props.displayLabels.map(d => (
          <Bar
            key={d}
            stackId="a"
            dataKey={d}
            fill={
              availableParties[props.userCountry].find(
                party => party.shortName === d
              ).color
            }
            barSize={50}
          />
        ))}
      </BarChart>
    </div>
  )
}
