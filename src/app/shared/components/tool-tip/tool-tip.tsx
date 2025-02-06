import * as React from "react";
import { Provider } from "@radix-ui/react-tooltip";
import "./tool-tip.css";
import { Arrow, Content, Portal, Root, Trigger } from "@radix-ui/react-dropdown-menu";

const Tooltip: React.FC<{toolTip?: string, children: React.ReactNode}> = (props) => {
    if (!props.toolTip) {
        return props.children;
    }
	return (
		<Provider>
			<Root>
				<Trigger asChild>
					{props.children}
				</Trigger>
				<Portal>
					<Content className="TooltipContent" sideOffset={5}>
						{props.toolTip}
						<Arrow className="TooltipArrow" />
					</Content>
				</Portal>
			</Root>
		</Provider>
	);
};

export default Tooltip;
