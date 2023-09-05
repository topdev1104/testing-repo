import React from 'react'
import Placeholder from './placeholder.svg'
import PlaceholderBlack from './placeholder-black.svg'


const Skeleton = (theme)=>{
    return(<div>
        <img src={theme.theme === 'theme-dark' ? PlaceholderBlack : Placeholder} alt=''/>
    </div>)
}

export default Skeleton