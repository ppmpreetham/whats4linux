import React from "react"
import Button from "./ToggleButton"
const SettingButtonDesc = ({
  title,
  description,
  settingtoggle,
}: {
  title: string
  description: string
  settingtoggle: () => void
}) => {
  return (
    <div className="flex flex-row justify-between">
      <div className="flex flex-col">
        <div className="text-xl text-white">{title}</div>
        <div className="text-md">{description}</div>
      </div>
      <Button onClick={settingtoggle} />
    </div>
  )
}

export default SettingButtonDesc
