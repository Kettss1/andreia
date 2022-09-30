import React from 'react';

type IconProps = {
    url: string;
}

type IconState = {
    type: string;
}

const root = document.getElementById('root')!;


export default class SvgIcon extends React.Component<IconProps, IconState> {
    constructor(props: IconProps) {
        super(props);

        this.state = {type: 'img'}
    }

    componentDidMount() {
        if(!this.props.url) return;

        const splittedUrl = this.props.url.split('.');
        const isSvg = splittedUrl.includes('svg');

        if(!isSvg) {
            this.setState({type: 'img'});
            return
        }

        this.setState({type: 'svg'});

        fetch(this.props.url, {
            mode: 'no-cors'
        }).then((resp) => resp.text()).then((svg) => root.innerHTML = svg)
    }
    render() {
        return (
            <div>
                {this.state.type != 'svg' && (
                    <img src={this.props.url} alt="icon" />
                )}
            </div>
        )
    }
}