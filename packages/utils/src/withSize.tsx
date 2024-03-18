import * as React from "react";
import AutoSizer, { Props as AutoSizerProps } from "react-virtualized-auto-sizer";

export interface WithSizeProps {
    readonly width?: number;
    readonly height?: number;
}

export const withSize = (props?: Omit<AutoSizerProps, "children">) => {
    return <TProps extends WithSizeProps>(OriginalComponent: React.ComponentClass<TProps> | React.FC<TProps>) => {
        return class WithSize extends React.Component<Omit<TProps, "width" | "height">> {
            public render() {
                return (
                    <AutoSizer {...props} disableHeight={false} disableWidth={false}>
                        {({ height, width }) => {
                            return <OriginalComponent {...(this.props as TProps)} height={height} width={width} />;
                        }}
                    </AutoSizer>
                );
            }
        };
    };
};
