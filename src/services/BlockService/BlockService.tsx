import { Dispatch, SetStateAction } from "react";

import { Flow } from "../../types/Flow";
import { processCheckboxes } from "./CheckboxProcessor";
import { processFunction } from "./FunctionProcessor";
import { processMessage } from "./MessageProcessor";
import { processOptions } from "./OptionProcessor";
import { processPath } from "./PathProcessor";
import { processRender } from "./RenderProcessor";
import { processTimeout } from "./TimeoutProcessor";
import { processTransition } from "./TransitionProcessor";
import { Params } from "../../types/Params";

/**
 * Handles the preprocessing within a block.
 * 
 * @param flow conversation flow for the bot
 * @param path path associated with the current block
 * @param params contains userInput, prevPath and injectMessage that can be used/passed into attributes
 * @param setTextAreaDisabled sets the state of the textarea for user input
 * @param setPaths updates the paths taken by the user
 * @param setTimeoutId sets the timeout id for the timeout attribute
 * @param handleActionInput handles action input from user 
 */
export const preProcessBlock = (flow: Flow, path: string, params: Params,
	setTextAreaDisabled: (inputDisabled: boolean) => void, setPaths: Dispatch<SetStateAction<string[]>>,
	setTimeoutId: (timeoutId: ReturnType<typeof setTimeout>) => void, 
	handleActionInput: (path: string, userInput: string, sendUserInput: boolean) => void) => {

	const block = flow[path];
	const attributes = Object.keys(block);
	for (const attribute of attributes) {
		switch (attribute) {
		case "message":
			processMessage(block, params);
			break;
		
		case "options":
			processOptions(block, path, params.injectMessage, handleActionInput);
			break;
		
		case "checkBoxes":
			processCheckboxes(block, path, params.injectMessage, handleActionInput);
			break;
		
		case "render":
			processRender(block, params);
			break;
		
		case "chatDisabled":
			if (block.chatDisabled != null) {
				setTextAreaDisabled(block.chatDisabled);
			}
			break;

		case "transition":
			processTransition(flow, path, params, setPaths);
			break;

		case "timeout":
			processTimeout(flow, path, params, setPaths, setTimeoutId);
		}
	}
}

/**
 * Handles the postprocessing within a block.
 * 
 * @param flow conversation flow for the bot
 * @param path path associated with the current block
 * @param params contains userInput, prevPath and injectMessage that can be used/passed into attributes
 * @param setPaths updates the paths taken by the user
 */
export const postProcessBlock = (flow: Flow, path: string, params: Params,
	setPaths: Dispatch<SetStateAction<string[]>>) => {

	const block = flow[path];
	const attributes = Object.keys(block);
	for (const attribute of attributes) {
		if (attribute === "function") {
			processFunction(block, params);
		}
	}

	// path is always executed last in post-processing
	if (attributes.includes("path")) {
		return processPath(block, params, setPaths);
	}
	return false;
}