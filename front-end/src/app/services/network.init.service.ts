import { Injectable } from "@angular/core";
import { DataSet, Edge } from "vis";
import { Node } from "../models/network.model";
import { random } from "lodash";

@Injectable()
export class NetworkInitService {
  public nameAuthors: any = [];
  public showCluster = true;
  public completeAuthors: any = [];
  public selectedAuthors: any = [];
  public groupedAuthors: { [key: string]: string[] } = {};
  public cluster: { min: number; max: number } = { min: 1, max: 1000 };
  private distances: { [key: string]: number } = {};
  public authorsRelations: any = [];
  public LCC: any = [];

  getNodes(): DataSet<Node> {
    this.groupedAuthors = {};
    this.nameAuthors = this.completeAuthors;

    this.nameAuthors = this.nameAuthors.map((author: any) => {
      let researcher = author.researcher;

      researcher = researcher
        .replace(/&aacute;/g, "á")
        .replace(/&eacute;/g, "é")
        .replace(/&iacute;/g, "í")
        .replace(/&oacute;/g, "ó")
        .replace(/&uacute;/g, "ú")
        .replace(/&ntilde;/g, "ñ")
        .replace(/&Aacute;/g, "Á")
        .replace(/&Eacute;/g, "É")
        .replace(/&Iacute;/g, "Í")
        .replace(/&Oacute;/g, "Ó")
        .replace(/&Uacute;/g, "Ú")
        .replace(/&Ntilde;/g, "Ñ")
        .replace(/&agrave;/g, "à")
        .replace(/&egrave;/g, "è")
        .replace(/&ograve;/g, "ò")
        .replace(/&Agrave;/g, "À")
        .replace(/&Egrave;/g, "È")
        .replace(/&Ograve;/g, "Ò")
        .replace(/&acirc;/g, "â")
        .replace(/&auml;/g, "ä")
        .replace(/&uuml; /g, "ü")
        .replace(/&icirc;/g, "î")
        .replace(/&Acirc;/g, "Â")
        .replace(/&atilde;/g, "ã")
        .replace(/&Atilde;/g, "Ã")
        .replace(/&ouml;/g, "ö")
        .replace(/&Ouml;/g, "Ö");

      author.researcher = researcher;

      return author;
    });

    this.nameAuthors.forEach(
      (author: { publications: string | any[]; researcher: string }) => {
        if (
          (author.publications.length < this.cluster.min ||
            author.publications.length > this.cluster.max) &&
          author.researcher != this.selectedAuthors[0]
        ) {
          const publicationCount = author.publications.length.toString();
          if (!this.groupedAuthors[publicationCount]) {
            this.groupedAuthors[publicationCount] = [];
          }
          this.groupedAuthors[publicationCount].push(author.researcher);
        }
      }
    );

    this.nameAuthors = this.nameAuthors.filter(
      (author: { publications: string[]; researcher: boolean }) =>
        (author.publications.length >= this.cluster.min &&
          author.publications.length <= this.cluster.max) ||
        author.researcher == this.selectedAuthors[0]
    );

    if (this.showCluster == true) {
      Object.keys(this.groupedAuthors).forEach((publicationCount) => {
        const authors = this.groupedAuthors[publicationCount];
        const count = parseInt(publicationCount);
        const publications = [];
        for (let i = 0; i < count; i++) {
          publications.push(" ");
        }
        const newAuthor = {
          researcher: authors.length.toString(),
          publications: publications,
        };

        this.nameAuthors.forEach((author: { researcher: string }) => {
          if (author.researcher === newAuthor.researcher) {
            newAuthor.researcher += " ";
          }
        });

        this.nameAuthors.push(newAuthor);
      });
    }

    var authorWithMostPublications;
    var authorWithLeastPublications;

    if (this.nameAuthors.length != 0) {
      authorWithMostPublications = this.nameAuthors.reduce(
        (prevAuthor: any, currentAuthor: any) => {
          if (currentAuthor.researcher !== this.selectedAuthors[0]) {
            if (
              !prevAuthor ||
              currentAuthor.publications.length > prevAuthor.publications.length
            ) {
              return currentAuthor;
            }
          }
          return prevAuthor;
        },
        null
      );

      authorWithLeastPublications = this.nameAuthors.reduce(
        (
          prevAuthor: { publications: string | any[] },
          currentAuthor: { publications: string | any[] }
        ) => {
          return prevAuthor.publications.length <
            currentAuthor.publications.length
            ? prevAuthor
            : currentAuthor;
        }
      );

      const maxPublications = authorWithMostPublications.publications.length;
      const minPublications = authorWithLeastPublications.publications.length;

      this.nameAuthors.forEach((author: any) => {
        if (author.researcher != this.selectedAuthors[0]) {
          if (maxPublications == minPublications) {
            this.distances[author.researcher] = 250;
          } else {
            const proportion =
              (maxPublications - author.publications.length) /
              (maxPublications - minPublications);
            const distance = (Math.pow(proportion, 4) * 300 + 400) * 4;
            this.distances[author.researcher] = distance;
          }
        }
      });
    }

    const sortedAuthors = this.nameAuthors.slice().sort((a: any, b: any) => {
      return a.publications.length - b.publications.length;
    });

    const totalAuthors = sortedAuthors.length;
    const angleStep = (Math.PI * 2) / totalAuthors;
    let currentAngle = 0;

    const nodesData: Node[] = sortedAuthors.map((author: any) => {
      let nodeSize = Math.floor(author.publications.length * 4) + 60;

      if (author.researcher === this.selectedAuthors[0]) {
        nodeSize = nodeSize + 50;
      }
      if (nodeSize > 200) {
        nodeSize = 200;
      }

      var distanceFromCenter = 0;

      if (this.selectedAuthors[0] != author.researcher) {
        var distanceFromCenter = this.distances[author.researcher];

        var x = Math.cos(currentAngle) * distanceFromCenter;
        var y = Math.sin(currentAngle) * distanceFromCenter;

        currentAngle += angleStep;

        return {
          id: author.researcher,
          label: author.researcher,
          font: {
            size: nodeSize,
            color: "#ffffff",
          },
          x: x,
          y: y,
        };
      } else {
        return {
          id: author.researcher,
          label: author.researcher,
          font: {
            size: nodeSize,
            color: "#ffffff",
          },
          x: 0,
          y: 0,
        };
      }
    });

    const nodes: DataSet<Node> = new DataSet(nodesData);
    return nodes;
  }

  getEdges(): DataSet<Edge> {
    const edgesData: Edge[] = this.nameAuthors
      .filter(
        (author: { researcher: any }) =>
          author.researcher !== this.selectedAuthors[0]
      )
      .map((author: { publications: string | any[]; researcher: any }) => {
        const numPublications = author.publications.length.toString();
        return {
          from: this.selectedAuthors[0],
          to: author.researcher,
          label: numPublications,
        };
      });

    this.nameAuthors = this.nameAuthors.filter(
      (author: { researcher: string }) => isNaN(Number(author.researcher))
    );

    if (this.showCluster == true) {
      Object.keys(this.groupedAuthors).forEach((publicationCount) => {
        const authors = this.groupedAuthors[publicationCount];
        const newAuthor = {
          researcher: authors.length.toString(),
          publications: authors,
        };

        this.nameAuthors.forEach((author: { researcher: string }) => {
          if (author.researcher === newAuthor.researcher) {
            newAuthor.researcher += " ";
          }
        });

        this.nameAuthors.push(newAuthor);
      });
    }

    const edges: DataSet<Edge> = new DataSet(edgesData);
    return edges;
  }

}
