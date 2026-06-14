import React, { useState } from 'react'
import ConfiguracionBatalla from '../../src/components/ConfiguracionBatalla'
import Batalla from '../../src/components/Batalla'

export default function PlayDuelo() {
    const [config, setConfig] = useState(null)

    if (config === null) {
        return <ConfiguracionBatalla onStart={setConfig} />
    }

    return <Batalla equipo={config.equipo} duelo={config.duelo} />
}
