import * as React from 'react';
import _ from 'lodash';
import {
    parsePyList,
    dumpPyList,
    dumpPyDict,
    parsePyDict,
    parsePyNumber,
    parsePyString,
    parsePyStringOrNumber,
} from './py_obj_parsing';

import classNames from 'classnames';
import AutosizeInput from 'react-input-autosize';

class ParsableInput extends React.Component {
    constructor(props) {
        super(props);
        // TODO: this is a hack
        // there should probably be a single source of truth
        this.state = {
            value: this.props.dumpValue(this.props.value),
            error: null,
        };
    }

    handleChange = event => {
        this.setState({
            value: event.target.value,
        });
        try {
            this.setState({
                error: null,
            });
            let value = this.props.parseValue(event.target.value);
            this.propsOnChangeThrottled(value);
        } catch (e) {
            this.setState({
                error: e,
                fml: true,
            });
        }
    };

    propsOnChangeThrottled = _.throttle(value => {
        this.props.onChange(value);
    }, 50);

    formatErrorMessageForBlock(e) {
        const text = e.message;
        const pos = e.pos;
        // TODO: check math for off-by-one type problems
        // TODO: take input width in the account
        if (text.length < pos - 1) {
            return _.padEnd(text + ' ', pos, '-') + '^';
        } else if (text.length - pos - 5 < text.length) {
            return _.padStart('', pos, ' ') + '^--- ' + text;
        } else {
            return [_.padStart('', pos - 1, ' ') + '^', <br />, text];
        }
    }

    render() {
        if (this.props.autogrowing) {
            return (
                <AutosizeInput
                    minWidth={140}
                    type="text"
                    className="parsable-input"
                    value={this.state.value}
                    onChange={this.handleChange}
                />
            );
        } else {
            let error;
            if (this.state.error) {
                const errorText = this.props.inline
                    ? this.state.error.message
                    : this.formatErrorMessageForBlock(this.state.error);
                error = (
                    <div
                        className={classNames('invalid-feedback', {
                            'invalid-feedback-block-parsable-input': !this.props.inline,
                        })}
                    >
                        {errorText}
                    </div>
                );
            }
            const className = classNames('parsable-input', 'form-control', {
                'fc-inline': this.props.inline,
                'is-invalid': !!error,
            });
            const divClassNames = classNames('parsable-input-with-error-div', {
                'parsable-input-inline': this.props.inline,
            });
            return (
                <div className={divClassNames}>
                    <input type="text" className={className} value={this.state.value} onChange={this.handleChange} />
                    {error}
                </div>
            );
        }
    }
}

export function PyListInput(props) {
    return <ParsableInput {...props} dumpValue={dumpPyList} parseValue={parsePyList} />;
}

export function PyDictInput(props) {
    return <ParsableInput {...props} dumpValue={dumpPyDict} parseValue={parsePyDict} />;
}

export function PyNumberInput(props) {
    return <ParsableInput {...props} dumpValue={JSON.stringify} parseValue={parsePyNumber} />;
}

export function PyStringInput(props) {
    return <ParsableInput {...props} dumpValue={JSON.stringify} parseValue={parsePyString} />;
}

export function PyStringOrNumberInput(props) {
    return <ParsableInput {...props} dumpValue={JSON.stringify} parseValue={parsePyStringOrNumber} />;
}
