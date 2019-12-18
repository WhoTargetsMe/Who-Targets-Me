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
      <tspan x={x} y={y} dy={"1.25em"} fill="#666">
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
        style={{ padding: "10px", borderRadius: 3, backgroundColor: "#000" }}
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

export const GroupedBarChart = props => {
  const data = Object.keys(props.advertisers)
    .filter(d => Array.isArray(props.advertisers[d]))
    .map(d => {
      return {
        name: props.filterLabels[d],
        ...props.advertisers[d].reduce(
          (prev, curr) => ({
            ...prev,
            [curr.party]: parseInt(curr.percentage, 10)
          }),
          {}
        )
      }
    })

  return (
    <div>
      <BarChart data={data} width={790} height={370} margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="1 3" />
        <Tooltip content={<CustomTooltip userCountry={props.userCountry} />} />
        <Legend verticalAlign="top" height={36} />
        <XAxis dataKey="name" tick={<AxisTick />} />
        <YAxis />
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
            barSize={25}
          />
        ))}
      </BarChart>
    </div>
  )
}
