import React, { Component, Children, PropTypes } from 'react'

class Tile extends Component {
  render () {
    return null
  }
}

Tile.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired
}

class Grid extends Component {
  constructor (props) {
    super(props)
    this.state = {
      locations: []
    }
    this.constructVgrid = this.constructVgrid.bind(this)
    this.constructVgrid()
  }

  constructVgrid () {
    const {
      gridWidth,
      tileSize,
      tileWidth,
      gutter,
      gutterVertical,
      children
    } = this.props

    const gv = gutterVertical || gutter
    const tw = tileWidth || tileSize
    const rowWidth = gridWidth / (tw + gh)

    let vgrid = (new Array(children.length || 0)).fill((new Array(rowWidth)).fill(false))
    let locations = []

    const place = (w, h) => {
      let x = -1, y = -1, breakOut = false
      for (const r of vgrid) {
        y++
        if (r.every(e => e)) continue // this row is full don't bother
        for (const c of r) {
          x++
          if (!c) {
            if (explore(x, y, w, h)) {
              // we have a spot let's go
              breakOut = true
              break
            }
          }
        }
        if (breakOut) break
      }

      (new Array(h)).fill(null).map((_, i) => i + y).forEach(i => {
        (new Array(w)).fill(null).map((_, j) => j + x).forEach(j => {
          vgrid[i][j] = true
        })
      })

      locations.push([x, y])
    }

    const explore = (x, y, w, h) => {
      let result = true
      for (const r of vgrid.slice(y, y + h)) {
        // we have our rows, let's check if they're all empty where we need them
        if (r.slice(x, x + w).some(e => e) && r.slice(x, x + w).length === w) {
          // there's something in a cell, nope
          result = false
          break
        }
      }
      return result
    }

    Children.forEach(child => {
      const {
        width,
        height
      } = child.props
      place(width, height)
    })

    this.setState({
      locations
    })
  }

  render () {
    const {
      tileSize,
      tileWidth,
      tileHeight,
      gutter,
      gutterWidth,
      gutterHeight,
      children,
      ...props
    } = this.props
    const gw = gutterWidth || gutter
    const gh = gutterHeight || gutter
    const tw = tileWidth || tileSize
    const th = tileHeight || tileSize
    return (
      <div {...props}>
        {
          Children.map((child, index) => {
            if (!locations[index]) return null
            const [x, y] = locations[index]
            const { width, height, children, ...rest } = child.props
            return (
              <div
                style={{
                  transform: `translate(${(x * (tw + gw))}px, ${(y * (th + gh))}px)`,
                  width: `${width * tw}px`,
                  height: `${height * th}px`,
                  transition: 'transform 0.2s ease-in'
                }} {...rest}>{children}</div>
            )
          })
        }
      </div>
    )
  }
}

Grid.propTypes = {
  gridWidth: PropTypes.number.isRequired,
  gridHeight: PropTypes.number.isRequired,
  tileSize: PropTypes.number,
  tileWidth: PropTypes.number,
  tileHeight: PropTypes.number,
  gutter: PropTypes.number,
  gutterWidth: PropTypes.number,
  gutterHeight: PropTypes.number,
  children: (props, propName, componentName) => {
    const prop = props[propName]
    let err = null
    Children.forEach(prop, child => {
      if (child.type !== Tile) {
        err = new Error('Grid children should be of type Tile')
      }
    })
    return err
  }
}
