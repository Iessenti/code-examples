import { useEffect } from 'react'
import styled from 'styled-components'

const ExternalWrapper = styled.div`
    max-width: 100%
    height: 110%

    min-height: fit-content
    width: fit-content

    overflow: hidden
    box-sizing: border-box

    -webkit-user-select: none
    -moz-user-select: none
    -ms-user-select: none
    user-select: none

    ::-webkit-scrollbar
        display: none
    & > div
        transform-origin: 0 0
        overflow: scroll
        display: flex
        width: fit-content
        flex-direction: row
        box-sizing: border-box
        ::-webkit-scrollbar
            display: none
`

const externalWrapperId = 'external-wrapper-id'
const innerSectionId = 'inner-section-id'

const ZoomMoveProvider = ({
    children
}) => {

    const element = document.getElementById(externalWrapperId)
    const wrapper = document.getElementById(innerSectionId)

    useEffect( () => {

        let prevX, prevY
        wrapper?.addEventListener('mousedown', (event) => {
            prevX = event.pageX
            prevY = event.pageY
        })
        
        wrapper?.addEventListener('mousemove', (event) => {
            if (event.buttons) {
                let draggingX = 0
                let draggingY = 0
                if (event.pageX - prevX !== 0) {
                    draggingX = prevX - event.pageX
                    prevX = event.pageX
                }
                if (event.pageY - prevY !== 0) {
                    draggingY = prevY - event.pageY
                    prevY = event.pageY
                }
                if (draggingX !== 0 || draggingY !== 0) {
                    wrapper.scrollBy(draggingX, draggingY)
                }
            }
        })

        let scale = 1
        const factor = 0.05
        const max_scale = 1.6

        const fn = (e) => {
            e.preventDefault();
            const { deltaY } = e;

            var isTrackpad = false;
            if (e.wheelDeltaY) {
                if (e.wheelDeltaY === (e.deltaY * -3)) {
                isTrackpad = true;
                }
            }
            else if (e.deltaMode === 0) {
                isTrackpad = true;
            }

            if (
                isTrackpad 
                ||
                (
                    Math.abs(deltaY) < 8 && !Number.isInteger(deltaY) // проверка на зум
                )
            ) {
                    let delta = (-1 * e.deltaY) || e.wheelDelta;
                    if (delta === undefined) {
                        delta = e.originalEvent.detail;
                    }

                    if ( (scale !== max_scale) && delta > 0 ) {
                        delta = Math.max(-1,Math.min(1,delta))

                        let offset = {
                            x: wrapper.scrollLeft, 
                            y: wrapper.scrollTop
                        }
                        let image_loc = {
                            x: e.pageX + offset.x,
                            y: e.pageY + offset.y
                        }
            
                        let zoom_point = {
                            x:image_loc.x/scale, 
                            y: image_loc.y/scale
                        }
                        scale += delta * factor * scale
                        scale = Math.max(1,Math.min(max_scale,scale))
                        setZoomScale(scale)
                        let zoom_point_new = {x:zoom_point.x * scale, y: zoom_point.y * scale}
            
                        let newScroll = {
                            x: Math.round(zoom_point_new.x - e.pageX),
                            y: Math.round(zoom_point_new.y - e.pageY)
                        }
                        
                        element.style.transform = `scale(${scale}, ${scale})`
            
                        wrapper.scrollTo({
                            left: newScroll.x, 
                            top: newScroll.y,
                            behavior: "smooth",
                        })
                    }
                }
            if (
                isTrackpad
                &&
                ! (
                    Math.abs(deltaY) < 8 && !Number.isInteger(deltaY) // проверка на зум
                )
            ) {
                wrapper.scrollTo({
                    top: wrapper.scrollTop + e.deltaY,
                    left: wrapper.scrollLeft + e.deltaX,
                    
                })
            }  
        }

        wrapper?.addEventListener('wheel', fn)

        return () => {
            wrapper?.removeEventListener('wheel', fn)
        }
    }, [])

    return (
        <ExternalWrapper id={ externalWrapperId } >   
            <div id={ innerSectionId }>
                {
                    children
                }
            </div>
        </ExternalWrapper>
    )
}

export default ZoomMoveProvider