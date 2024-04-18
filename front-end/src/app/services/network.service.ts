import { Injectable } from "@angular/core";
import { Options, DataSet } from "vis";

@Injectable()
export class AppNetworkService {


  public getNetworkOptions(): Options {
    return {
      autoResize: true,
      height: "600px",
      width: "100%",
      physics: { enabled: false },
      layout: {
        improvedLayout: true,
      },
      edges: {
        font: {
          size: 100,
          color: "rgb(0, 22, 68)",
       },
        color: {
          color: "rgb(0, 22, 68)", 
          highlight: "#00ff00",
          hover: "#0000ff"
        },
        width: 2, 
        arrows: {
          to: { enabled: true, scaleFactor: 0.5 } 
        },
        smooth: {
          enabled: true,
          type: 'dynamic',
          roundness: 0.5
        },
      },
      nodes: {
        scaling: {
          min: 150,
          max: 300,
        },
        size: 100,
        font: {
          size: 20,
          color: "#ffffff"
        },
        color: {
          background: "rgb(0, 22, 68)",
          border: "#000000", 
          highlight: {
            background: "#00ff00", 
            border: "#000000" 
          },
          hover: {
            background: "#0000ff", 
            border: "#000000" 
          }
        },
      }
    };
  }
}